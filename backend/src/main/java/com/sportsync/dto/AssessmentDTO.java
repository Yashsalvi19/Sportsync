package com.sportsync.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long coachId;
    private String coachName;
    private String title;
    private Double score;
    private Double maxScore;
    private String feedback;
    private LocalDate assessmentDate;
}
