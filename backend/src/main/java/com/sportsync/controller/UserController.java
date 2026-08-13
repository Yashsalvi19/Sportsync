package com.sportsync.controller;

import com.sportsync.dto.ApiResponse;
import com.sportsync.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/profile-picture")
    public ResponseEntity<ApiResponse<Void>> updateProfilePicture(@RequestBody Map<String, String> payload) {
        String url = payload.get("url");
        if (url == null || url.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("URL is required"));
        }
        userService.updateProfilePicture(url);
        return ResponseEntity.ok(ApiResponse.success("Profile picture updated successfully", null));
    }
}
