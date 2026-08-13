package com.sportsync.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentDTO {
    private Long id;
    private UUID studentId;
    private String studentName;
    private UUID coachId;
    private String coachName;
    private String title;
    private Double score;
    private Double maxScore;
    private String feedback;
    private LocalDate assessmentDate;
}
