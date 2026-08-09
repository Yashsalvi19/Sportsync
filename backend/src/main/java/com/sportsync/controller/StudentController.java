package com.sportsync.controller;

import com.sportsync.dto.ApiResponse;
import com.sportsync.dto.StudentDTO;
import com.sportsync.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH')")
    public ResponseEntity<ApiResponse<List<StudentDTO>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.success("Students retrieved", studentService.getAllStudents()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<StudentDTO>> updateStudent(
            @PathVariable UUID id, @RequestBody StudentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Student updated", studentService.updateStudent(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable UUID id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted", null));
    }
}
