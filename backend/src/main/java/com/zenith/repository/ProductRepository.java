package com.zenith.repository;

import com.zenith.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryIgnoreCase(String category);
    List<Product> findByFeaturedTrue();
    List<Product> findByNameContainingIgnoreCase(String keyword);
}
