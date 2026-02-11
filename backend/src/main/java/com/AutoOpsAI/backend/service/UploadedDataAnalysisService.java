package com.AutoOpsAI.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Month;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.openxml4j.exceptions.OLE2NotOfficeXmlFileException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Value;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.AutoOpsAI.backend.dto.AnalyzeUploadRequest;
import com.AutoOpsAI.backend.dto.AnalyzeUploadResponse;
import com.AutoOpsAI.backend.dto.FileAnalysisSummary;
import com.AutoOpsAI.backend.dto.InventoryInsightsRequest;
import com.AutoOpsAI.backend.dto.InventoryInsightsResponse;
import com.AutoOpsAI.backend.model.DataSource;
import com.AutoOpsAI.backend.repo.DataSourceRepository;

@Service
public class UploadedDataAnalysisService {

    private final InventoryInsightsService inventoryInsightsService;
    private final DataSourceRepository dataSourceRepository;
    private final Path uploadDir;

    public UploadedDataAnalysisService(
            InventoryInsightsService inventoryInsightsService,
            DataSourceRepository dataSourceRepository,
            @Value("${upload.directory:uploads}") String uploadDir) {
        this.inventoryInsightsService = inventoryInsightsService;
        this.dataSourceRepository = dataSourceRepository;
        Path base = Path.of("").toAbsolutePath();
        Path configured = Path.of(uploadDir);
        this.uploadDir = configured.isAbsolute() ? configured : base.resolve(configured).normalize();
    }

    public AnalyzeUploadResponse analyze(List<AnalyzeUploadRequest.FileReference> files) {
        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "No files requested for analysis");
        }

        Map<String, Aggregate> aggregates = new LinkedHashMap<>();
        SeasonalAccumulator seasonalAccumulator = new SeasonalAccumulator();
        List<FileAnalysisSummary> summaries = new ArrayList<>();
        long totalRecords = 0;

        for (AnalyzeUploadRequest.FileReference file : files) {
            Path resolved = resolveUploadPath(file.storedName());
            long rows = parseFile(resolved, aggregates, seasonalAccumulator);
            totalRecords += rows;
            summaries.add(new FileAnalysisSummary(file.storedName(), file.originalName(), rows));
            recordDataSource(file.originalName(), rows);
        }

        if (aggregates.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "No usable product rows found in uploaded files");
        }

        InventoryInsightsRequest request = buildRequest(aggregates, seasonalAccumulator);
        InventoryInsightsResponse insights = inventoryInsightsService.generateInsights(request);

        return new AnalyzeUploadResponse(
                insights,
                files.size(),
                totalRecords,
                aggregates.size(),
                summaries
        );
    }

    private Path resolveUploadPath(String storedName) {
        if (!StringUtils.hasText(storedName)) {
            throw new ResponseStatusException(BAD_REQUEST, "Missing stored file name");
        }
        Path resolved = uploadDir.resolve(storedName).normalize();
        if (!resolved.startsWith(uploadDir)) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid file reference");
        }
        if (!Files.exists(resolved)) {
            throw new ResponseStatusException(BAD_REQUEST, "File not found: " + storedName);
        }
        return resolved;
    }

    private long parseFile(Path path, Map<String, Aggregate> aggregates, SeasonalAccumulator seasonalAccumulator) {
        String filename = path.getFileName().toString().toLowerCase(Locale.ENGLISH);
        if (filename.endsWith(".xls") || filename.endsWith(".xlsx")) {
            return parseExcel(path, aggregates, seasonalAccumulator);
        }
        return parseDelimited(path, aggregates, seasonalAccumulator);
    }

    private long parseDelimited(Path path, Map<String, Aggregate> aggregates, SeasonalAccumulator seasonalAccumulator) {
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreEmptyLines(true)
                .setTrim(true)
                .build();
        long rows = 0;
        try (Reader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8);
             CSVParser parser = format.parse(reader)) {
            for (CSVRecord record : parser) {
                rows++;
                Map<String, String> row = record.toMap();
                ingestRow(row, rows, aggregates, seasonalAccumulator);
            }
        } catch (IOException ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Unable to parse file: " + path.getFileName(), ex);
        }
        return rows;
    }

    private long parseExcel(Path path, Map<String, Aggregate> aggregates, SeasonalAccumulator seasonalAccumulator) {
        long rows = 0;
        try (InputStream inputStream = Files.newInputStream(path);
             Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;
            if (sheet == null) {
                return 0;
            }

            DataFormatter formatter = new DataFormatter();
            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) {
                return 0;
            }
            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                String header = formatter.formatCellValue(cell);
                headers.add(header == null ? "" : header.trim().toLowerCase(Locale.ENGLISH));
            }
            int firstDataRow = headerRow.getRowNum() + 1;
            for (int rowIndex = firstDataRow; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) {
                    continue;
                }
                Map<String, String> mapped = new LinkedHashMap<>();
                for (int column = 0; column < headers.size(); column++) {
                    String header = headers.get(column);
                    if (!StringUtils.hasText(header)) {
                        continue;
                    }
                    Cell cell = row.getCell(column, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                    String value = cell == null ? null : formatter.formatCellValue(cell);
                    if (value != null) {
                        mapped.put(header, value.trim());
                    }
                }
                if (mapped.isEmpty()) {
                    continue;
                }
                rows++;
                ingestRow(mapped, rows, aggregates, seasonalAccumulator);
            }
        } catch (OLE2NotOfficeXmlFileException ole2) {
            // If a CSV was uploaded but has .xls extension, fall back to text parsing
            return parseDelimited(path, aggregates, seasonalAccumulator);
        } catch (IOException ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Unable to parse Excel file: " + path.getFileName(), ex);
        }
        return rows;
    }

    private void ingestRow(Map<String, String> row, long rowNumber, Map<String, Aggregate> aggregates, SeasonalAccumulator seasonalAccumulator) {
        if (row == null || row.values().stream().noneMatch(StringUtils::hasText)) {
            return;
        }
        String productId = firstNonBlank(row, "product_id", "id", "sku", "item_id");
        if (!StringUtils.hasText(productId)) {
            productId = "product-" + rowNumber;
        }
        Aggregate aggregate = aggregates.computeIfAbsent(productId, Aggregate::new);
        aggregate.name = coalesce(aggregate.name, firstNonBlank(row, "product_name", "name", "title"));
        aggregate.price = coalesce(aggregate.price, parseDouble(firstNonBlank(row, "price", "unit_price", "cost")));
        aggregate.currentStock = coalesce(aggregate.currentStock, parseInteger(firstNonBlank(row, "current_stock", "stock", "quantity", "on_hand")));
        aggregate.reorderLevel = coalesce(aggregate.reorderLevel, parseInteger(firstNonBlank(row, "reorder_level", "reorder", "safety_stock")));
        Integer sold = parseInteger(firstNonBlank(row, "quantity_sold", "sold", "orders", "quantity", "qty", "units"));
        if (sold != null) {
            String action = firstNonBlank(row, "action", "event_type", "event");
            if (isPurchaseAction(action)) {
                aggregate.totalSales += sold;
            }
        }

        seasonalAccumulator.ingest(row);

        String sentiment = normalizeSentiment(firstNonBlank(row, "feedback_sentiment", "sentiment", "customer_sentiment"));
        if (sentiment != null) {
            Integer weight = coalesce(parseInteger(firstNonBlank(row, "feedback_count", "responses", "mentions")), 1);
            aggregate.recordFeedback(sentiment, weight);
        }

        String trendLabel = normalizeTrendLabel(firstNonBlank(row, "trend_label", "sales_trend", "pattern", "momentum"));
        if (trendLabel != null) {
            aggregate.setTrend(trendLabel);
        }
    }

    private InventoryInsightsRequest buildRequest(Map<String, Aggregate> aggregates, SeasonalAccumulator seasonalAccumulator) {
        List<InventoryInsightsRequest.ProductInput> products = new ArrayList<>();
        List<InventoryInsightsRequest.InventoryInput> inventory = new ArrayList<>();
        List<InventoryInsightsRequest.SalesInput> sales = new ArrayList<>();
        List<InventoryInsightsRequest.FeedbackSignalInput> feedbackSignals = new ArrayList<>();
        List<InventoryInsightsRequest.TrendSignalInput> trendSignals = new ArrayList<>();

        aggregates.values().forEach(aggregate -> {
            String name = StringUtils.hasText(aggregate.name) ? aggregate.name : "Product " + aggregate.productId;
            double price = aggregate.price != null ? aggregate.price.doubleValue() : 0d;
            int stock = Objects.requireNonNullElse(aggregate.currentStock, 0);
            int reorder = Objects.requireNonNullElse(aggregate.reorderLevel, Math.max(5, stock / 4));
            int totalSales = aggregate.totalSales > 0 ? aggregate.totalSales : Math.max(1, Math.max(stock / 2, 10));

            products.add(new InventoryInsightsRequest.ProductInput(aggregate.productId, name, price));
            inventory.add(new InventoryInsightsRequest.InventoryInput(aggregate.productId, stock, reorder));
            sales.addAll(generateSalesSeries(aggregate.productId, totalSales));
            InventoryInsightsRequest.FeedbackSignalInput feedback = aggregate.toFeedbackSignal();
            if (feedback != null) {
                feedbackSignals.add(feedback);
            }
            trendSignals.add(aggregate.toTrendSignal());
        });

        return new InventoryInsightsRequest(
            products,
            inventory,
            sales,
            seasonalAccumulator.toSignals(),
            feedbackSignals,
            trendSignals.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toList())
        );
    }

    private List<InventoryInsightsRequest.SalesInput> generateSalesSeries(String productId, int totalSales) {
        List<InventoryInsightsRequest.SalesInput> series = new ArrayList<>();
        int segments = Math.min(7, Math.max(1, totalSales));
        int base = Math.max(1, totalSales / segments);
        int remainder = Math.max(0, totalSales - (base * segments));

        for (int i = 0; i < segments; i++) {
            int qty = base + (i < remainder ? 1 : 0);
            series.add(new InventoryInsightsRequest.SalesInput(productId, OffsetDateTime.now().minusDays(i), qty));
        }
        return series;
    }

    private void recordDataSource(String displayName, long rows) {
        DataSource source = new DataSource();
        source.setName(StringUtils.hasText(displayName) ? displayName : "Uploaded dataset");
        source.setType("inventory_upload");
        boolean hasRows = rows > 0;
        source.setStatus(hasRows ? "completed" : "empty");
        source.setProgress(hasRows ? 100 : 0);
        source.setLastUpdated(OffsetDateTime.now());
        dataSourceRepository.save(source);
    }

    private static String firstNonBlank(Map<String, String> row, String... keys) {
        for (String key : keys) {
            if (key == null) continue;
            String value = row.get(key);
            if (StringUtils.hasText(value)) {
                return value.trim();
            }
        }
        return null;
    }

    private static Integer parseInteger(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return Double.valueOf(value.trim()).intValue();
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private static Double parseDouble(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return Double.valueOf(value.trim());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private static boolean isPurchaseAction(String action) {
        if (!StringUtils.hasText(action)) {
            return true;
        }
        String normalized = action.trim().toLowerCase(Locale.ENGLISH);
        return normalized.contains("buy")
                || normalized.contains("purchase")
                || normalized.contains("order")
                || normalized.contains("checkout")
                || normalized.contains("sale");
    }

    private static <T> T coalesce(T current, T next) {
        return current != null ? current : next;
    }

    private static final class Aggregate {
        private final String productId;
        private String name;
        private Double price;
        private Integer currentStock;
        private Integer reorderLevel;
        private int totalSales;
        private int positiveFeedback;
        private int negativeFeedback;
        private int neutralFeedback;
        private String trendLabel;

        private Aggregate(String productId) {
            this.productId = Objects.requireNonNull(productId);
        }

        private void recordFeedback(String sentiment, int weight) {
            switch (sentiment) {
                case "POSITIVE" -> positiveFeedback += weight;
                case "NEGATIVE" -> negativeFeedback += weight;
                case "NEUTRAL" -> neutralFeedback += weight;
                default -> {
                }
            }
        }

        private void setTrend(String trend) {
            if (StringUtils.hasText(trend)) {
                this.trendLabel = trend;
            }
        }

        private InventoryInsightsRequest.FeedbackSignalInput toFeedbackSignal() {
            if (positiveFeedback == 0 && negativeFeedback == 0 && neutralFeedback == 0) {
                return null;
            }
            return new InventoryInsightsRequest.FeedbackSignalInput(
                    productId,
                    positiveFeedback,
                    negativeFeedback,
                    neutralFeedback
            );
        }

        private InventoryInsightsRequest.TrendSignalInput toTrendSignal() {
            if (!StringUtils.hasText(trendLabel)) {
                return null;
            }
            return new InventoryInsightsRequest.TrendSignalInput(productId, trendLabel);
        }
    }

    private static final class SeasonalAccumulator {
        private final Map<Integer, SeasonalRecord> records = new HashMap<>();

        private void ingest(Map<String, String> row) {
            Integer month = parseMonth(row);
            if (month == null) {
                return;
            }
            SeasonalRecord record = records.computeIfAbsent(month, SeasonalRecord::new);
            record.observe(row);
        }

        private List<InventoryInsightsRequest.SeasonalSignalInput> toSignals() {
                return records.values().stream()
                    .sorted((a, b) -> Integer.compare(a.month, b.month))
                    .map(SeasonalRecord::toSignal)
                    .filter(Objects::nonNull)
                        .collect(Collectors.toList());
        }
    }

    private static final class SeasonalRecord {
        private final int month;
        private final Map<String, Integer> weatherCounts = new HashMap<>();
        private final Map<String, Integer> festivalCounts = new HashMap<>();
        private double demandModifierSum = 0d;
        private int demandModifierCount = 0;

        private SeasonalRecord(int month) {
            this.month = month;
        }

        private void observe(Map<String, String> row) {
            String weather = firstNonBlank(row, "weather", "climate", "season");
            if (StringUtils.hasText(weather)) {
                weatherCounts.merge(weather.trim().toUpperCase(Locale.ENGLISH), 1, Integer::sum);
            }
            String festival = firstNonBlank(row, "festival", "event", "holiday");
            if (StringUtils.hasText(festival)) {
                festivalCounts.merge(festival.trim(), 1, Integer::sum);
            }
            Double modifier = parseDouble(firstNonBlank(row, "demand_modifier", "demand_factor", "uplift"));
            if (modifier != null && modifier > 0) {
                demandModifierSum += modifier;
                demandModifierCount++;
            }
        }

        private InventoryInsightsRequest.SeasonalSignalInput toSignal() {
            if (demandModifierCount == 0 && weatherCounts.isEmpty() && festivalCounts.isEmpty()) {
                return null;
            }
            double modifier = demandModifierCount == 0 ? 1.0 : demandModifierSum / demandModifierCount;
            String dominantWeather = weatherCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);
            String dominantFestival = festivalCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);
            return new InventoryInsightsRequest.SeasonalSignalInput(
                    month,
                    dominantWeather,
                    dominantFestival,
                    modifier
            );
        }
    }

    private static Integer parseMonth(Map<String, String> row) {
        String monthValue = firstNonBlank(row, "month", "month_of_year", "month_num");
        if (StringUtils.hasText(monthValue)) {
            Integer numeric = parseMonthValue(monthValue);
            if (numeric != null) {
                return numeric;
            }
        }
        String date = firstNonBlank(row, "sale_date", "date", "timestamp");
        if (StringUtils.hasText(date)) {
            try {
                return OffsetDateTime.parse(date).getMonthValue();
            } catch (Exception ignored) {
                try {
                    return Month.valueOf(date.trim().toUpperCase(Locale.ENGLISH)).getValue();
                } catch (Exception ignoredToo) {
                    return null;
                }
            }
        }
        return null;
    }

    private static Integer parseMonthValue(String raw) {
        try {
            int numeric = Integer.parseInt(raw.trim());
            if (numeric >= 1 && numeric <= 12) {
                return numeric;
            }
        } catch (NumberFormatException ignored) {
            try {
                return Month.valueOf(raw.trim().toUpperCase(Locale.ENGLISH)).getValue();
            } catch (Exception ignoredToo) {
                return null;
            }
        }
        return null;
    }

    private static String normalizeSentiment(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String normalized = value.trim().toUpperCase(Locale.ENGLISH);
        return switch (normalized) {
            case "POS", "POSITIVE" -> "POSITIVE";
            case "NEG", "NEGATIVE" -> "NEGATIVE";
            case "NEU", "NEUTRAL" -> "NEUTRAL";
            default -> null;
        };
    }

    private static String normalizeTrendLabel(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String normalized = value.trim().toUpperCase(Locale.ENGLISH);
        if (normalized.contains("POS") || normalized.contains("INCREAS")) {
            return "POSITIVE";
        }
        if (normalized.contains("NEG") || normalized.contains("DECLIN")) {
            return "NEGATIVE";
        }
        if (normalized.contains("STAB")) {
            return "STABLE";
        }
        return normalized;
    }
}
