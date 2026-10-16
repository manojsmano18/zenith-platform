package com.zenith.service;

import com.zenith.model.AnalyticsSummary;
import com.zenith.model.Order;
import com.zenith.repository.OrderRepository;
import com.zenith.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public AnalyticsService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    public AnalyticsSummary getAnalyticsSummary() {
        Double totalRevenue = orderRepository.calculateTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = 0.0;
        }

        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        double aov = totalOrders > 0 ? totalRevenue / totalOrders : 0.0;

        List<Object[]> rawTopSelling = orderRepository.findTopSellingProductsRaw();
        List<Map<String, Object>> topSelling = new ArrayList<>();

        int limit = Math.min(rawTopSelling.size(), 5);
        for (int i = 0; i < limit; i++) {
            Object[] row = rawTopSelling.get(i);
            Map<String, Object> map = new HashMap<>();
            map.put("productName", row[0]);
            map.put("totalSold", row[1]);
            map.put("revenue", row[2]);
            topSelling.add(map);
        }

        List<Order> recentOrders = orderRepository.findTop10ByOrderByCreatedAtDesc();

        return new AnalyticsSummary(
                Math.round(totalRevenue * 100.0) / 100.0,
                totalOrders,
                totalProducts,
                Math.round(aov * 100.0) / 100.0,
                topSelling,
                recentOrders
        );
    }
}
