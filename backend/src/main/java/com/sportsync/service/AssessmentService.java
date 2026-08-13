package com.sportsync.service;

import com.sportsync.dto.AssessmentDTO;
import com.sportsync.model.Assessment;
import com.sportsync.model.User;
import com.sportsync.repository.AssessmentRepository;
import com.sportsync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public AssessmentDTO createAssessment(AssessmentDTO dto) {
        User student = userRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        User coach = userRepository.findById(dto.getCoachId())
                .orElseThrow(() -> new RuntimeException("Coach not found"));

        Assessment assessment = new Assessment();
        assessment.setStudent(student);
        assessment.setCoach(coach);
        assessment.setTitle(dto.getTitle());
        assessment.setScore(dto.getScore());
        assessment.setMaxScore(dto.getMaxScore());
        assessment.setFeedback(dto.getFeedback());
        assessment.setAssessmentDate(dto.getAssessmentDate() != null ? dto.getAssessmentDate() : LocalDate.now());

        assessment = assessmentRepository.save(assessment);
        return mapToDTO(assessment);
    }

    @Transactional(readOnly = true)
    public List<AssessmentDTO> getAssessmentsForStudent(Long studentId) {
        return assessmentRepository.findByStudentIdOrderByAssessmentDateDesc(studentId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssessmentDTO> getAssessmentsByCoach(Long coachId) {
        return assessmentRepository.findByCoachIdOrderByAssessmentDateDesc(coachId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private AssessmentDTO mapToDTO(Assessment assessment) {
        AssessmentDTO dto = new AssessmentDTO();
        dto.setId(assessment.getId());
        dto.setStudentId(assessment.getStudent().getId());
        dto.setStudentName(assessment.getStudent().getFirstName() + " " + assessment.getStudent().getLastName());
        dto.setCoachId(assessment.getCoach().getId());
        dto.setCoachName(assessment.getCoach().getFirstName() + " " + assessment.getCoach().getLastName());
        dto.setTitle(assessment.getTitle());
        dto.setScore(assessment.getScore());
        dto.setMaxScore(assessment.getMaxScore());
        dto.setFeedback(assessment.getFeedback());
        dto.setAssessmentDate(assessment.getAssessmentDate());
        return dto;
    }
}
