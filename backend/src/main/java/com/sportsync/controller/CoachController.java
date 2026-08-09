package com.sportsync.controller;

import com.sportsync.dto.ApiResponse;
import com.sportsync.dto.CoachDTO;
import com.sportsync.service.CoachService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/coaches")
@RequiredArgsConstructor
public class CoachController {

    private final CoachService coachService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<CoachDTO>>> getAllCoaches() {
        return ResponseEntity.ok(ApiResponse.success("Coaches retrieved", coachService.getAllCoaches()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<CoachDTO>> updateCoach(
            @PathVariable UUID id, @RequestBody CoachDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Coach updated", coachService.updateCoach(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCoach(@PathVariable UUID id) {
        coachService.deleteCoach(id);
        return ResponseEntity.ok(ApiResponse.success("Coach deleted", null));
    }
}
