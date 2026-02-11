package com.AutoOpsAI.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record InventoryInsightsRequest(
        @JsonProperty("products") List<ProductInput> products,
        @JsonProperty("inventory") List<InventoryInput> inventory,
        @JsonProperty("sales") List<SalesInput> sales,
        @JsonProperty("seasonal_context") List<SeasonalSignalInput> seasonalContext,
        @JsonProperty("feedback_signals") List<FeedbackSignalInput> feedbackSignals,
        @JsonProperty("trend_signals") List<TrendSignalInput> trendSignals
) {
    public boolean hasPayload() {
        return !(isEmpty(products)
                && isEmpty(inventory)
                && isEmpty(sales)
                && isEmpty(seasonalContext)
                && isEmpty(feedbackSignals)
                && isEmpty(trendSignals));
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

    public record SeasonalSignalInput(
            @JsonProperty("month") Integer month,
            @JsonProperty("weather") String weather,
            @JsonProperty("festival") String festival,
            @JsonProperty("demand_modifier") Double demandModifier
    ) {
    }

    public record FeedbackSignalInput(
            @JsonProperty("product_id") String productId,
            @JsonProperty("positive") Integer positive,
            @JsonProperty("negative") Integer negative,
            @JsonProperty("neutral") Integer neutral
    ) {
    }

    public record TrendSignalInput(
            @JsonProperty("product_id") String productId,
            @JsonProperty("trend_label") String trendLabel
    ) {
    }
}
