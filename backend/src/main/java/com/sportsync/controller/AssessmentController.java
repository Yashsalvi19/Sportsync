package com.sportsync.controller;

import com.sportsync.dto.ApiResponse;
import com.sportsync.dto.AssessmentDTO;
import com.sportsync.service.AssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AssessmentDTO>> createAssessment(@RequestBody AssessmentDTO dto) {
        AssessmentDTO created = assessmentService.createAssessment(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Assessment created successfully"));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<AssessmentDTO>>> getAssessmentsForStudent(@PathVariable UUID studentId) {
        List<AssessmentDTO> assessments = assessmentService.getAssessmentsForStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success(assessments, "Assessments retrieved successfully"));
    }

    @GetMapping("/coach/{coachId}")
    public ResponseEntity<ApiResponse<List<AssessmentDTO>>> getAssessmentsByCoach(@PathVariable UUID coachId) {
        List<AssessmentDTO> assessments = assessmentService.getAssessmentsByCoach(coachId);
        return ResponseEntity.ok(ApiResponse.success(assessments, "Assessments retrieved successfully"));
    }
}
