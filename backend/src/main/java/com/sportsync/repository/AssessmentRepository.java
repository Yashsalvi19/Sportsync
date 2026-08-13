package com.sportsync.repository;

import com.sportsync.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.UUID;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByStudentIdOrderByAssessmentDateDesc(UUID studentId);
    List<Assessment> findByCoachIdOrderByAssessmentDateDesc(UUID coachId);
}
