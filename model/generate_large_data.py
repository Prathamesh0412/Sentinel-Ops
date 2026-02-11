"""Utility script for generating a large synthetic retail dataset.

Run with `python generate_large_data.py` from the `model/` directory.
This will create CSV files (users, products, inventory, sales) under
`model/demo-data/` that can be uploaded through the dashboard for
end-to-end ML analysis.
"""

from __future__ import annotations

import random
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

random.seed(42)
np.random.seed(42)

NUM_USERS = 5_000
NUM_PRODUCTS = 200
NUM_INTERACTIONS = 200_000
OUTPUT_DIR = Path(__file__).parent / "demo-data"


def build_users() -> pd.DataFrame:
    rows = []
    for uid in range(1, NUM_USERS + 1):
        rows.append(
            {
                "user_id": uid,
                "age": random.randint(18, 60),
                "city": random.choice(["Mumbai", "Pune", "Delhi", "Bangalore"]),
                "joined_date": datetime.today() - timedelta(days=random.randint(1, 1_000)),
            }
        )
    return pd.DataFrame(rows)


def build_products() -> pd.DataFrame:
    rows = []
    for pid in range(1, NUM_PRODUCTS + 1):
        rows.append(
            {
                "product_id": pid,
                "product_name": f"Product_{pid}",
                "category": random.choice(["Electronics", "Fashion", "Grocery"]),
                "price": random.randint(200, 5_000),
            }
        )
    return pd.DataFrame(rows)


def build_inventory() -> pd.DataFrame:
    rows = []
    for pid in range(1, NUM_PRODUCTS + 1):
        rows.append(
            {
                "product_id": pid,
                "current_stock": random.randint(200, 1_000),
                "reorder_level": random.randint(100, 300),
            }
        )
    return pd.DataFrame(rows)


def build_sales() -> pd.DataFrame:
    rows = []
    for sid in range(1, NUM_INTERACTIONS + 1):
        rows.append(
            {
                "sale_id": sid,
                "user_id": random.randint(1, NUM_USERS),
                "product_id": random.randint(1, NUM_PRODUCTS),
                "quantity": random.choice([0, 1, 2]),
                "action": random.choice(["VIEW", "BUY"]),
                "timestamp": datetime.today() - timedelta(days=random.randint(0, 180)),
            }
        )
    return pd.DataFrame(rows)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    datasets = {
        "users": build_users(),
        "products": build_products(),
        "inventory": build_inventory(),
        "sales": build_sales(),
    }

    for name, df in datasets.items():
        path = OUTPUT_DIR / f"{name}.csv"
        df.to_csv(path, index=False)
        print(f"Wrote {len(df):>7} rows to {path.relative_to(Path.cwd())}")

    print("Synthetic dataset ready. Upload products.csv, inventory.csv, and sales.csv via the dashboard upload panel to drive ML insights.")


if __name__ == "__main__":
    main()
