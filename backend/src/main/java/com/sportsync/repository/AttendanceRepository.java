package com.sportsync.repository;

import com.sportsync.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {
    List<Attendance> findByStudentId(UUID studentId);
    Optional<Attendance> findByStudentIdAndSessionDate(UUID studentId, LocalDate sessionDate);
}
