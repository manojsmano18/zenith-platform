package com.zenith.service;

import com.zenith.model.Order;
import com.zenith.model.OrderItem;
import com.zenith.model.Product;
import com.zenith.repository.OrderRepository;
import com.zenith.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByCustomerEmail(String email) {
        return orderRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email);
    }

    @Transactional
    public Order placeOrder(Order order) {
        double calculatedSubtotal = 0.0;

        for (OrderItem item : order.getItems()) {
            if (item.getProductId() != null) {
                Product product = productRepository.findById(item.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + item.getProductId()));

                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new IllegalStateException("Insufficient stock for product: " + product.getName());
                }

                // Decrement inventory stock
                product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                productRepository.save(product);

                // Ensure price and product name are set from database authority
                item.setPrice(product.getPrice());
                item.setProductName(product.getName());
            }

            calculatedSubtotal += item.getPrice() * item.getQuantity();
            item.setOrder(order);
        }

        order.setSubtotalAmount(Math.round(calculatedSubtotal * 100.0) / 100.0);

        // Calculate Promo Code Discount
        double discount = 0.0;
        String code = order.getPromoCode() != null ? order.getPromoCode().trim().toUpperCase() : "";
        if ("ZENITH10".equals(code)) {
            discount = calculatedSubtotal * 0.10;
        } else if ("WELCOME500".equals(code) && calculatedSubtotal >= 2000.0) {
            discount = 500.0;
        } else if ("SUPERDEAL".equals(code)) {
            discount = calculatedSubtotal * 0.20;
        }

        order.setDiscountAmount(Math.round(discount * 100.0) / 100.0);
        double finalTotal = Math.max(0.0, calculatedSubtotal - discount);
        order.setTotalAmount(Math.round(finalTotal * 100.0) / 100.0);

        if (order.getPaymentMethod() == null || order.getPaymentMethod().isBlank()) {
            order.setPaymentMethod("Cash on Delivery");
        }

        if (order.getStatus() == null || order.getStatus().isBlank()) {
            order.setStatus("CONFIRMED");
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));
        order.setStatus(newStatus.toUpperCase().replace(" ", "_"));
        return orderRepository.save(order);
    }
}
