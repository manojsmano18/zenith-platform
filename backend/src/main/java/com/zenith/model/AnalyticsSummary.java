package com.zenith.model;

import java.util.List;
import java.util.Map;

public class AnalyticsSummary {

    private Double totalRevenue;
    private Long totalOrders;
    private Long totalProducts;
    private Double averageOrderValue;
    private List<Map<String, Object>> topSellingProducts;
    private List<Order> recentOrders;

    public AnalyticsSummary() {
    }

    public AnalyticsSummary(Double totalRevenue, Long totalOrders, Long totalProducts, Double averageOrderValue, List<Map<String, Object>> topSellingProducts, List<Order> recentOrders) {
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.totalProducts = totalProducts;
        this.averageOrderValue = averageOrderValue;
        this.topSellingProducts = topSellingProducts;
        this.recentOrders = recentOrders;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public Double getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(Double averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }

    public List<Map<String, Object>> getTopSellingProducts() {
        return topSellingProducts;
    }

    public void setTopSellingProducts(List<Map<String, Object>> topSellingProducts) {
        this.topSellingProducts = topSellingProducts;
    }

    public List<Order> getRecentOrders() {
        return recentOrders;
    }

    public void setRecentOrders(List<Order> recentOrders) {
        this.recentOrders = recentOrders;
    }
}
