package com.AutoOpsAI.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record InventoryInsightsResponse(
        @JsonProperty("sales_stats") List<SalesStat> salesStats,
        @JsonProperty("stock_status") List<StockStatus> stockStatus,
        @JsonProperty("best_selling_product") BestSellingProduct bestSellingProduct,
        @JsonProperty("sales_trends") List<SalesTrend> salesTrends,
        @JsonProperty("demand_clusters") List<DemandCluster> demandClusters,
        @JsonProperty("price_recommendations") List<PriceRecommendation> priceRecommendations,
        @JsonProperty("assortment_recommendations") List<AssortmentRecommendation> assortmentRecommendations,
        @JsonProperty("discount_recommendations") List<DiscountRecommendation> discountRecommendations,
        @JsonProperty("generated_at") OffsetDateTime generatedAt
) {
    public record SalesStat(
            @JsonProperty("product_id") String productId,
            @JsonProperty("total_sales") Double totalSales,
            @JsonProperty("avg_daily_sales") Double avgDailySales
    ) {
    }

    public record StockStatus(
            @JsonProperty("product_id") String productId,
            @JsonProperty("current_stock") Integer currentStock,
            @JsonProperty("days_until_stock_out") Double daysUntilStockOut,
            @JsonProperty("stock_status") String stockStatus
    ) {
    }

    public record BestSellingProduct(
            @JsonProperty("product_id") String productId,
            @JsonProperty("total_sales") Double totalSales,
            @JsonProperty("avg_daily_sales") Double avgDailySales
    ) {
    }

    public record SalesTrend(
            @JsonProperty("product_id") String productId,
            @JsonProperty("trend") String trend
    ) {
    }

    public record DemandCluster(
            @JsonProperty("product_id") String productId,
            @JsonProperty("total_sales") Double totalSales,
            @JsonProperty("cluster") Integer cluster
    ) {
    }

    public record PriceRecommendation(
            @JsonProperty("product_id") String productId,
            @JsonProperty("recommended_price") Double recommendedPrice,
            @JsonProperty("current_price") Double currentPrice,
            @JsonProperty("expected_impact") String expectedImpact,
            @JsonProperty("rationale") String rationale
    ) {
    }

    public record AssortmentRecommendation(
            @JsonProperty("product_id") String productId,
            @JsonProperty("action") String action,
            @JsonProperty("reason") String reason,
            @JsonProperty("confidence") Double confidence
    ) {
    }

    public record DiscountRecommendation(
            @JsonProperty("product_id") String productId,
            @JsonProperty("suggested_discount") Double suggestedDiscount,
            @JsonProperty("trigger_window") String triggerWindow,
            @JsonProperty("notes") String notes
    ) {
    }
}
