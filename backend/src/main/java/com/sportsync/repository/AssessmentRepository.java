package com.sportsync.repository;

import com.sportsync.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByStudentIdOrderByAssessmentDateDesc(Long studentId);
    List<Assessment> findByCoachIdOrderByAssessmentDateDesc(Long coachId);
}
