package com.sportsync.controller;

import com.sportsync.dto.ApiResponse;
import com.sportsync.dto.AttendanceDTO;
import com.sportsync.security.UserDetailsImpl;
import com.sportsync.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAllAttendance() {
        return ResponseEntity.ok(ApiResponse.success("Attendance retrieved", attendanceService.getAllAttendance()));
    }
    
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH', 'ROLE_STUDENT')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAttendanceByStudent(@PathVariable UUID studentId) {
        return ResponseEntity.ok(ApiResponse.success("Student attendance retrieved", attendanceService.getAttendanceByStudent(studentId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH')")
    public ResponseEntity<ApiResponse<AttendanceDTO>> markAttendance(
            @RequestBody AttendanceDTO dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Attendance marked", attendanceService.markAttendance(dto, userDetails.getUser().getId())));
    }
}
