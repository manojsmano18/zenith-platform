package com.zenith.controller;

import com.zenith.model.User;
import com.zenith.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class RegisterRequest {
        private String fullName;
        private String email;
        private String password;
        private String phoneNumber;
        private String shippingAddress;

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public String getShippingAddress() {
            return shippingAddress;
        }

        public void setShippingAddress(String shippingAddress) {
            this.shippingAddress = shippingAddress;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";
        String password = request.getPassword() != null ? request.getPassword() : "";

        // Check if admin login
        if (("admin".equalsIgnoreCase(identifier) || "admin@zenith.com".equalsIgnoreCase(identifier))
                && "admin123".equals(password)) {
            Map<String, Object> adminData = new HashMap<>();
            adminData.put("id", 0L);
            adminData.put("fullName", "System Administrator");
            adminData.put("email", "admin@zenith.com");
            adminData.put("phoneNumber", "+91 80 4000 8000");
            adminData.put("role", "ADMIN");
            adminData.put("shippingAddress", "Zenith HQ, MG Road, Bengaluru, KA");

            return ResponseEntity.ok(Map.of(
                    "token", "zenith_admin_jwt_" + System.currentTimeMillis(),
                    "user", adminData
            ));
        }

        // Check registered customer
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(identifier);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            User user = userOpt.get();
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("fullName", user.getFullName());
            userData.put("email", user.getEmail());
            userData.put("phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
            userData.put("shippingAddress", user.getShippingAddress() != null ? user.getShippingAddress() : "");
            userData.put("role", user.getRole());

            return ResponseEntity.ok(Map.of(
                    "token", "zenith_user_jwt_" + System.currentTimeMillis(),
                    "user", userData
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid email or password. Please check your credentials."));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }
        if (request.getPassword() == null || request.getPassword().length() < 4) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 4 characters."));
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Full name is required."));
        }

        if (userRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "An account with this email already exists."));
        }

        User newUser = new User(
                request.getFullName().trim(),
                request.getEmail().trim().toLowerCase(),
                request.getPassword(),
                request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : "",
                request.getShippingAddress() != null ? request.getShippingAddress().trim() : "",
                "CUSTOMER"
        );

        User saved = userRepository.save(newUser);

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", saved.getId());
        userData.put("fullName", saved.getFullName());
        userData.put("email", saved.getEmail());
        userData.put("phoneNumber", saved.getPhoneNumber());
        userData.put("shippingAddress", saved.getShippingAddress());
        userData.put("role", saved.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "token", "zenith_user_jwt_" + System.currentTimeMillis(),
                "user", userData,
                "message", "Account registered successfully"
        ));
    }
}
