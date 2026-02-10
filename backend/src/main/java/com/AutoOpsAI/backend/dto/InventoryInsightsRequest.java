package com.AutoOpsAI.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record InventoryInsightsRequest(
        @JsonProperty("products") List<ProductInput> products,
        @JsonProperty("inventory") List<InventoryInput> inventory,
        @JsonProperty("sales") List<SalesInput> sales
) {
    public boolean hasPayload() {
        return !(isEmpty(products) && isEmpty(inventory) && isEmpty(sales));
    }

    private static boolean isEmpty(List<?> list) {
        return list == null || list.isEmpty();
    }

    public record ProductInput(
            @JsonProperty("product_id") String productId,
            @JsonProperty("product_name") String productName,
            @JsonProperty("price") Double price
    ) {
    }

    public record InventoryInput(
            @JsonProperty("product_id") String productId,
            @JsonProperty("current_stock") Integer currentStock,
            @JsonProperty("reorder_level") Integer reorderLevel
    ) {
    }

    public record SalesInput(
            @JsonProperty("product_id") String productId,
            @JsonProperty("sale_date") OffsetDateTime saleDate,
            @JsonProperty("quantity_sold") Integer quantitySold
    ) {
    }
}
