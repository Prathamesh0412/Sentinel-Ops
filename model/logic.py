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
		return ModelInput(_default_products(), _default_inventory(), _default_sales())

	data = json.loads(path.read_text(encoding="utf-8"))
	products = _ensure_frame(data.get("products", []), ["product_id", "product_name", "price"])
	inventory = _ensure_frame(data.get("inventory", []), ["product_id", "current_stock", "reorder_level"])
	sales = _ensure_frame(data.get("sales", []), ["product_id", "sale_date", "quantity_sold"])
	if not sales.empty:
		sales["sale_date"] = pd.to_datetime(sales["sale_date"])
	return ModelInput(products, inventory, sales)


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


def run_model(inputs: ModelInput) -> Dict[str, Any]:
	stats = _sales_stats(inputs.sales)
	stock = _stock_health(inputs.inventory, stats)
	trends = _trend_analysis(inputs.sales)
	clusters = _demand_clusters(stats)

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
		"sales_trends": trends,
		"demand_clusters": clusters,
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
