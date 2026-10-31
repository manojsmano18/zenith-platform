package com.zenith.repository;

import com.zenith.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findTop10ByOrderByCreatedAtDesc();

    List<Order> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o WHERE o.status != 'CANCELLED'")
    Double calculateTotalRevenue();

    @Query("SELECT oi.productName AS name, SUM(oi.quantity) AS totalSold, SUM(oi.price * oi.quantity) AS revenue " +
           "FROM OrderItem oi " +
           "GROUP BY oi.productName " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProductsRaw();
}
