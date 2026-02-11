"""Inventory intelligence model entrypoint.

This module can be used as a CLI (`python logic.py`) or imported from
the Spring Boot backend. It ingests optional JSON payloads describing
products, inventory, and sales history, then emits structured insights
that the dashboard can render.
"""

from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression

try:
	import matplotlib.pyplot as plt  # type: ignore
except Exception:  # pragma: no cover - plotting is optional
	plt = None


@dataclass
class ModelInput:
	products: pd.DataFrame
	inventory: pd.DataFrame
	sales: pd.DataFrame
	seasonal: pd.DataFrame
	feedback: pd.DataFrame
	trend_overrides: pd.DataFrame


def _default_products() -> pd.DataFrame:
	return pd.DataFrame(
		{
			"product_id": ["1", "2", "3"],
			"product_name": ["Soap", "Shampoo", "Toothpaste"],
			"price": [30.0, 120.0, 60.0],
		}
	)


def _default_inventory() -> pd.DataFrame:
	return pd.DataFrame(
		{
			"product_id": ["1", "2", "3"],
			"current_stock": [120, 45, 80],
			"reorder_level": [40, 20, 30],
		}
	)


def _default_sales() -> pd.DataFrame:
	rng = np.random.default_rng(42)
	dates = pd.date_range(end=pd.Timestamp.today(), periods=30)
	rows: List[Dict[str, Any]] = []
	for pid in ["1", "2", "3"]:
		for day, qty in zip(dates, rng.integers(2, 10, size=30)):
			rows.append({
				"product_id": pid,
				"sale_date": day,
				"quantity_sold": int(qty),
			})
	return pd.DataFrame(rows)


def _serialize(value: Any) -> Any:
	if isinstance(value, (np.generic,)):
		return value.item()
	if isinstance(value, (pd.Timestamp, datetime)):
		return value.isoformat()
	if isinstance(value, dict):
		return {k: _serialize(v) for k, v in value.items()}
	if isinstance(value, (list, tuple, np.ndarray)):
		return [_serialize(v) for v in value]
	if value is math.inf:
		return "Infinity"
	if value is -math.inf:
		return "-Infinity"
	return value


def _ensure_frame(records: Iterable[Dict[str, Any]], required: Iterable[str]) -> pd.DataFrame:
	frame = pd.DataFrame(records)
	missing = [col for col in required if col not in frame.columns]
	if missing:
		raise ValueError(f"Missing columns: {', '.join(missing)}")
	return frame


def _load_input(path: Optional[Path]) -> ModelInput:
	if not path:
		return ModelInput(
			_default_products(),
			_default_inventory(),
			_default_sales(),
			pd.DataFrame(),
			pd.DataFrame(),
			pd.DataFrame(),
		)

	data = json.loads(path.read_text(encoding="utf-8"))
	products = _ensure_frame(data.get("products", []), ["product_id", "product_name", "price"])
	inventory = _ensure_frame(data.get("inventory", []), ["product_id", "current_stock", "reorder_level"])
	sales = _ensure_frame(data.get("sales", []), ["product_id", "sale_date", "quantity_sold"])
	if not sales.empty:
		sales["sale_date"] = pd.to_datetime(sales["sale_date"])
	seasonal = pd.DataFrame(data.get("seasonal_context", []))
	feedback = pd.DataFrame(data.get("feedback_signals", []))
	trend_overrides = pd.DataFrame(data.get("trend_signals", []))
	return ModelInput(products, inventory, sales, seasonal, feedback, trend_overrides)


def _sales_stats(sales: pd.DataFrame) -> pd.DataFrame:
	if sales.empty:
		return pd.DataFrame(columns=["product_id", "total_sales", "avg_daily_sales"])
	grouped = (
		sales.groupby("product_id")
		.agg(total_sales=("quantity_sold", "sum"), avg_daily_sales=("quantity_sold", "mean"))
		.reset_index()
	)
	return grouped


def _stock_health(inventory: pd.DataFrame, stats: pd.DataFrame) -> pd.DataFrame:
	if inventory.empty:
		return pd.DataFrame(columns=["product_id", "current_stock", "days_until_stock_out", "stock_status"])
	merged = inventory.merge(stats, on="product_id", how="left").fillna({"avg_daily_sales": 0.0, "total_sales": 0.0})

	def _days(row: pd.Series) -> Optional[float]:
		avg = row["avg_daily_sales"]
		if avg <= 0:
			return None
		return float(row["current_stock"]) / float(avg)

	def _status(days: Optional[float]) -> str:
		if days is None:
			return "NO_SALES_DATA"
		if days <= 7:
			return "CRITICAL"
		if days <= 14:
			return "WATCH"
		return "HEALTHY"

	merged["days_until_stock_out"] = merged.apply(_days, axis=1)
	merged["stock_status"] = merged["days_until_stock_out"].map(_status)
	return merged[["product_id", "current_stock", "days_until_stock_out", "stock_status"]]


def _trend_analysis(sales: pd.DataFrame) -> List[Dict[str, Any]]:
	if sales.empty:
		return []
	results: List[Dict[str, Any]] = []
	for pid, group in sales.groupby("product_id"):
		ordered = group.sort_values("sale_date")
		if len(ordered) < 2:
			results.append({"product_id": pid, "trend": "INSUFFICIENT_DATA"})
			continue
		X = np.arange(len(ordered)).reshape(-1, 1)
		y = ordered["quantity_sold"].to_numpy()
		model = LinearRegression()
		model.fit(X, y)
		slope = model.coef_[0]
		if slope > 0.1:
			label = "INCREASING"
		elif slope < -0.1:
			label = "DECREASING"
		else:
			label = "STABLE"
		results.append({"product_id": pid, "trend": label})
	return results


def _demand_clusters(stats: pd.DataFrame) -> List[Dict[str, Any]]:
	if stats.empty:
		return []
	n_clusters = min(3, len(stats))
	if n_clusters <= 1:
		return [
			{
				"product_id": row.product_id,
				"total_sales": float(row.total_sales),
				"cluster": 0,
			}
			for row in stats.itertuples(index=False)
		]
	model = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
	clusters = model.fit_predict(stats[["total_sales"]])
	stats = stats.assign(cluster=clusters)
	return [
		{
			"product_id": row.product_id,
			"total_sales": float(row.total_sales),
			"cluster": int(row.cluster),
		}
		for row in stats.itertuples(index=False)
	]



def _build_trend_map(trends: List[Dict[str, Any]], overrides: pd.DataFrame) -> Dict[str, str]:
	trend_map = {item["product_id"]: item["trend"] for item in trends}
	if overrides.empty:
		return trend_map
	for value in overrides.to_dict(orient="records"):
		pid = value.get("product_id")
		label = value.get("trend_label")
		if not pid or not label:
			continue
		trend_map[pid] = str(label).upper()
	return trend_map


def _feedback_summary(feedback: pd.DataFrame) -> Dict[str, Dict[str, int]]:
	if feedback.empty:
		return {}
	required = {"positive", "negative", "neutral"}
	for column in required:
		if column not in feedback.columns:
			feedback[column] = 0
	subset = feedback[["positive", "negative", "neutral"]].apply(pd.to_numeric, errors="coerce").fillna(0)
	feedback[["positive", "negative", "neutral"]] = subset.astype(int)
	grouped = feedback.groupby("product_id")[ ["positive", "negative", "neutral"] ].sum()
	return grouped.to_dict(orient="index")


def _seasonal_snapshot(seasonal: pd.DataFrame) -> Dict[str, Any]:
	if seasonal.empty:
		return {"current_modifier": 1.0, "current_weather": None, "current_festival": None}
	frame = seasonal.copy()
	if "month" not in frame.columns:
		frame["month"] = np.nan
	frame["month"] = pd.to_numeric(frame["month"], errors="coerce")
	current_month = datetime.now().month
	current = frame[frame["month"] == current_month]
	if current.empty:
		current = frame
	modifier_series = current.get("demand_modifier", pd.Series([1.0]))
	modifier_series = pd.to_numeric(modifier_series, errors="coerce")
	current_modifier = modifier_series.mean(skipna=True)
	current_weather = current.get("weather", pd.Series([None])).dropna().tail(1).to_list()
	current_festival = current.get("festival", pd.Series([None])).dropna().tail(1).to_list()
	return {
		"current_modifier": float(current_modifier) if not math.isnan(current_modifier) else 1.0,
		"current_weather": current_weather[0] if current_weather else None,
		"current_festival": current_festival[0] if current_festival else None,
	}


def _sentiment_score(summary: Dict[str, int]) -> float:
	pos = summary.get("positive", 0)
	neg = summary.get("negative", 0)
	neu = summary.get("neutral", 0)
	total = pos + neg + neu
	if total == 0:
		return 0.0
	return (pos - neg) / total


def _price_recommendations(
	products: pd.DataFrame,
	stats: pd.DataFrame,
	feedback_scores: Dict[str, Dict[str, int]],
	trend_map: Dict[str, str],
	seasonal_snapshot: Dict[str, Any],
) -> List[Dict[str, Any]]:
	if products.empty:
		return []
	stats_map = {row["product_id"]: row for row in stats.to_dict(orient="records")}
	modifier = seasonal_snapshot.get("current_modifier", 1.0) or 1.0
	recs: List[Dict[str, Any]] = []
	for product in products.to_dict(orient="records"):
		pid = product.get("product_id")
		price = float(product.get("price") or 0)
		if price <= 0:
			continue
		sentiment = _sentiment_score(feedback_scores.get(pid, {}))
		trend = trend_map.get(pid, "STABLE")
		adjustment = 0.0
		rationale: List[str] = []
		if modifier > 1.05:
			adjustment += min(0.05 * (modifier - 1), 0.08)
			rationale.append("Seasonal uplift")
		elif modifier < 0.95:
			adjustment -= min(0.04 * (1 - modifier), 0.08)
			rationale.append("Seasonal softness")
		if sentiment > 0.25:
			adjustment += 0.03
			rationale.append("Positive feedback")
		elif sentiment < -0.25:
			adjustment -= 0.05
			rationale.append("Negative feedback")
		trend_upper = str(trend).upper()
		if trend_upper in {"INCREASING", "POSITIVE"}:
			adjustment += 0.04
			rationale.append("Demand trending up")
		elif trend_upper in {"DECREASING", "NEGATIVE"}:
			adjustment -= 0.06
			rationale.append("Demand trending down")
		adjustment = max(-0.15, min(0.15, adjustment))
		recommended = round(price * (1 + adjustment), 2)
		impact = stats_map.get(pid, {}).get("total_sales")
		recs.append(
			{
				"product_id": pid,
				"current_price": price,
				"recommended_price": recommended,
				"expected_impact": f"Targeting +/-{abs(int(adjustment * 100))}% revenue shift" if adjustment else "Maintain price",
				"rationale": ", ".join(sorted(set(rationale))) or "Stable demand",
			}
		)
	return recs


def _assortment_recommendations(
	stock: pd.DataFrame,
	trend_map: Dict[str, str],
) -> List[Dict[str, Any]]:
	if stock.empty:
		return []
	recs: List[Dict[str, Any]] = []
	for row in stock.to_dict(orient="records"):
		pid = row.get("product_id")
		status = str(row.get("stock_status") or "").upper()
		days = row.get("days_until_stock_out")
		trend = trend_map.get(pid, "STABLE")
		if status == "CRITICAL":
			recs.append(
			{
				"product_id": pid,
				"action": "REORDER",
				"reason": f"Projected stockout in {days:.1f} days" if days else "Stockout risk",
				"confidence": 0.92,
			}
		)
		elif status == "WATCH":
			recs.append(
			{
				"product_id": pid,
				"action": "PLAN_REPLENISHMENT",
				"reason": "Runway tightening amid demand",
				"confidence": 0.84,
			}
		)
		elif trend in {"INCREASING", "POSITIVE"}:
			recs.append(
			{
				"product_id": pid,
				"action": "PROMOTE",
				"reason": "Momentum detected — push bundles",
				"confidence": 0.78,
			}
		)
	return recs


def _discount_recommendations(
	products: pd.DataFrame,
	trend_map: Dict[str, str],
	feedback_scores: Dict[str, Dict[str, int]],
	seasonal_snapshot: Dict[str, Any],
) -> List[Dict[str, Any]]:
	recs: List[Dict[str, Any]] = []
	if products.empty:
		return recs
	trigger = seasonal_snapshot.get("current_festival") or seasonal_snapshot.get("current_weather") or "upcoming cycle"
	for product in products.to_dict(orient="records"):
		pid = product.get("product_id")
		sentiment = _sentiment_score(feedback_scores.get(pid, {}))
		trend = trend_map.get(pid, "STABLE")
		if sentiment < -0.15 or trend in {"NEGATIVE", "DECREASING"}:
			discount = 10.0
			if sentiment < -0.4:
				discount = 15.0
			recs.append(
			{
				"product_id": pid,
				"suggested_discount": discount,
				"trigger_window": str(trigger).title() if trigger else "promo window",
				"notes": "Counter negative sentiment" if sentiment < -0.15 else "Stimulate demand",
			}
		)
	return recs


def run_model(inputs: ModelInput) -> Dict[str, Any]:
	stats = _sales_stats(inputs.sales)
	stock = _stock_health(inputs.inventory, stats)
	trends = _trend_analysis(inputs.sales)
	clusters = _demand_clusters(stats)
	trend_map = _build_trend_map(trends, inputs.trend_overrides)
	feedback_scores = _feedback_summary(inputs.feedback)
	seasonal_snapshot = _seasonal_snapshot(inputs.seasonal)
	price_recs = _price_recommendations(inputs.products, stats, feedback_scores, trend_map, seasonal_snapshot)
	assortment_recs = _assortment_recommendations(stock, trend_map)
	discount_recs = _discount_recommendations(inputs.products, trend_map, feedback_scores, seasonal_snapshot)
	combined_trends: List[Dict[str, Any]] = []
	seen: set[str] = set()
	for item in trends:
		pid = item.get("product_id")
		label = trend_map.get(pid, item.get("trend")) if pid else item.get("trend")
		combined_trends.append({"product_id": pid, "trend": label})
		if pid:
			seen.add(pid)
	for pid, label in trend_map.items():
		if pid in seen:
			continue
		combined_trends.append({"product_id": pid, "trend": label})

	best = None
	if not stats.empty:
		top = stats.loc[stats["total_sales"].idxmax()]
		best = {
			"product_id": top["product_id"],
			"total_sales": float(top["total_sales"]),
			"avg_daily_sales": float(top["avg_daily_sales"]),
		}

	return {
		"sales_stats": stats.to_dict(orient="records"),
		"stock_status": stock.to_dict(orient="records"),
		"best_selling_product": best,
		"sales_trends": combined_trends,
		"demand_clusters": clusters,
		"price_recommendations": price_recs,
		"assortment_recommendations": assortment_recs,
		"discount_recommendations": discount_recs,
		"generated_at": datetime.now(timezone.utc).isoformat(),
	}


def _render_text(summary: Dict[str, Any]) -> str:
	lines: List[str] = ["Sales Stats:"]
	for stat in summary["sales_stats"]:
		lines.append(
			f"- Product {stat['product_id']}: total={stat['total_sales']} avg_daily={stat['avg_daily_sales']:.2f}"
		)
	lines.append("\nStock Alerts:")
	for stock in summary["stock_status"]:
		days = stock["days_until_stock_out"]
		readable = "no data" if days is None else f"{days:.1f} days"
		lines.append(f"- Product {stock['product_id']}: {stock['stock_status']} ({readable})")
	lines.append("\nTrends:")
	for trend in summary["sales_trends"]:
		lines.append(f"- Product {trend['product_id']}: {trend['trend']}")
	return "\n".join(lines)


def _plot(summary: Dict[str, Any]) -> None:
	if plt is None:
		raise RuntimeError("matplotlib is required for plotting")
	stats = summary["sales_stats"]
	if not stats:
		print("No sales data to plot.")
		return
	names = [str(item["product_id"]) for item in stats]
	totals = [item["total_sales"] for item in stats]
	plt.figure(figsize=(8, 4))
	plt.bar(names, totals)
	plt.title("Total Sales per Product")
	plt.xlabel("Product")
	plt.ylabel("Units Sold")
	plt.tight_layout()
	plt.show()


def main(argv: Optional[List[str]] = None) -> None:
	parser = argparse.ArgumentParser(description="Inventory insights model")
	parser.add_argument("--input-file", type=Path, help="Optional JSON payload path")
	parser.add_argument("--output-format", choices=["json", "text"], default="json")
	parser.add_argument("--plot", action="store_true", help="Render matplotlib output")
	args = parser.parse_args(argv)

	inputs = _load_input(args.input_file)
	summary = run_model(inputs)

	if args.output_format == "json":
		print(json.dumps(summary, default=_serialize))
	else:
		print(_render_text(summary))

	if args.plot:
		_plot(summary)


if __name__ == "__main__":
	main()
