package com.sportsync.controller;

import com.sportsync.dto.ApiResponse;
import com.sportsync.dto.FeeDTO;
import com.sportsync.service.FeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService feeService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH')")
    public ResponseEntity<ApiResponse<List<FeeDTO>>> getAllFees() {
        return ResponseEntity.ok(ApiResponse.success("Fees retrieved", feeService.getAllFees()));
    }
    
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STUDENT')")
    public ResponseEntity<ApiResponse<List<FeeDTO>>> getFeesByStudent(@PathVariable UUID studentId) {
        return ResponseEntity.ok(ApiResponse.success("Student fees retrieved", feeService.getFeesByStudent(studentId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH')")
    public ResponseEntity<ApiResponse<FeeDTO>> createFee(@RequestBody FeeDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Fee record created", feeService.createFee(dto)));
    }
    
    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH')")
    public ResponseEntity<ApiResponse<FeeDTO>> markAsPaid(@PathVariable UUID id, @RequestParam String transactionId) {
        return ResponseEntity.ok(ApiResponse.success("Fee marked as paid", feeService.markAsPaid(id, transactionId)));
    }
}
