package com.zenith.config;

import com.zenith.model.Order;
import com.zenith.model.OrderItem;
import com.zenith.model.Product;
import com.zenith.model.User;
import com.zenith.repository.OrderRepository;
import com.zenith.repository.ProductRepository;
import com.zenith.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(ProductRepository productRepository, OrderRepository orderRepository, UserRepository userRepository) {
        return args -> {
            // Seed Demo Customer Account
            if (!userRepository.existsByEmailIgnoreCase("alex@example.com")) {
                User demoUser = new User(
                        "Alex Mercer",
                        "alex@example.com",
                        "password123",
                        "+91 98765 43210",
                        "Flat 402, Prestige Towers, Indiranagar, Bengaluru, KA 560038",
                        "CUSTOMER"
                );
                userRepository.save(demoUser);
            }

            if (productRepository.count() > 0) {
                return; // already seeded
            }

            // Seed 10 High Performance Hardware Products with local image assets and INR prices
            Product p1 = new Product(
                    "Zenith Aero ANC Headphones",
                    "Studio-grade wireless over-ear headphones with custom titanium drivers and 40-hour battery life.",
                    24999.00,
                    "Audio",
                    "/images/headphones.jpg",
                    45,
                    4.9,
                    true
            );

            Product p2 = new Product(
                    "Apex Mechanical Keyboard",
                    "Custom lubricated linear switches, solid CNC aluminum chassis, hot-swappable PCB, and RGB backlighting.",
                    14499.00,
                    "Peripherals",
                    "/images/keyboard.jpg",
                    30,
                    4.8,
                    true
            );

            Product p3 = new Product(
                    "Titan Precision Ergonomic Mouse",
                    "Ergonomic wireless mouse with 26K DPI optical sensor, infinite scroll wheel, and sub-1ms response time.",
                    7999.00,
                    "Peripherals",
                    "/images/mouse.jpg",
                    60,
                    4.7,
                    false
            );

            Product p4 = new Product(
                    "Vanguard 4K OLED Monitor 32\"",
                    "Cinema-grade 4K 144Hz OLED panel with HDR1000, 99% DCI-P3 color accuracy, and 90W USB-C charging.",
                    64999.00,
                    "Displays",
                    "/images/monitor.jpg",
                    15,
                    5.0,
                    true
            );

            Product p5 = new Product(
                    "Lumina Smart Desk Lamp",
                    "Aerospace-grade aluminum desk lamp with dual ambient light, circadian rhythm tuning, and wireless charging pad.",
                    4499.00,
                    "Workspace",
                    "/images/lamp.jpg",
                    50,
                    4.6,
                    false
            );

            Product p6 = new Product(
                    "SoundSphere Studio Monitor Speakers",
                    "Compact desktop reference monitors with custom woven Kevlar drivers and acoustic isolation pads.",
                    28999.00,
                    "Audio",
                    "/images/speakers.jpg",
                    25,
                    4.9,
                    true
            );

            Product p7 = new Product(
                    "Zenith Microfiber Stealth Desk Mat",
                    "Heavy-textured water-resistant desk pad with zero-slip rubber base and reinforced anti-fray stitching.",
                    2499.00,
                    "Workspace",
                    "/images/deskmat.jpg",
                    75,
                    4.8,
                    false
            );

            Product p8 = new Product(
                    "Iris 4K Ultra Pro Webcam",
                    "4K 60FPS streaming webcam with dual beamforming noise-cancelling mics, autofocus, and physical privacy shutter.",
                    11999.00,
                    "Peripherals",
                    "/images/webcam.jpg",
                    40,
                    4.7,
                    false
            );

            Product p9 = new Product(
                    "Zenith Pulse Wireless Earbuds",
                    "Ultra-compact ANC earbuds with hybrid active noise cancellation, spatial audio, and wireless charging case.",
                    16999.00,
                    "Audio",
                    "/images/earbuds.jpg",
                    35,
                    4.8,
                    true
            );

            Product p10 = new Product(
                    "Stratos Ergonomic Laptop Riser",
                    "Foldable CNC-machined aluminum laptop riser with cable management channel and optimal airflow cooling.",
                    3999.00,
                    "Workspace",
                    "/images/stand.jpg",
                    65,
                    4.9,
                    false
            );

            productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10));

            // Seed Initial Orders in INR with Cash on Delivery
            Order o1 = new Order(
                    "Alex Mercer",
                    "alex@example.com",
                    "+91 98765 43210",
                    "Flat 402, Prestige Towers, Indiranagar, Bengaluru, KA 560038",
                    39498.00,
                    "CONFIRMED"
            );
            o1.setCreatedAt(LocalDateTime.now().minusDays(3));
            o1.setPaymentMethod("Cash on Delivery");
            o1.addItem(new OrderItem(p1.getId(), p1.getName(), p1.getPrice(), 1));
            o1.addItem(new OrderItem(p2.getId(), p2.getName(), p2.getPrice(), 1));

            Order o2 = new Order(
                    "Samantha Hayes",
                    "samantha@example.com",
                    "+91 99887 76655",
                    "Plot 18, Road No. 36, Jubilee Hills, Hyderabad, TS 500033",
                    64999.00,
                    "SHIPPED"
            );
            o2.setCreatedAt(LocalDateTime.now().minusDays(2));
            o2.setPaymentMethod("Cash on Delivery");
            o2.addItem(new OrderItem(p4.getId(), p4.getName(), p4.getPrice(), 1));

            Order o3 = new Order(
                    "Marcus Vance",
                    "marcus@example.com",
                    "+91 91234 56789",
                    "B-1402, Oberoi Sky City, Borivali East, Mumbai, MH 400066",
                    29498.00,
                    "DELIVERED"
            );
            o3.setCreatedAt(LocalDateTime.now().minusDays(1));
            o3.setPaymentMethod("Cash on Delivery");
            o3.addItem(new OrderItem(p1.getId(), p1.getName(), p1.getPrice(), 1));
            o3.addItem(new OrderItem(p5.getId(), p5.getName(), p5.getPrice(), 1));

            orderRepository.saveAll(List.of(o1, o2, o3));

            System.out.println(">>> Zenith Database Initialized: 10 Products with Local Assets & 3 COD Orders Seeded.");
        };
    }
}
