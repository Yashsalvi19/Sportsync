package com.sportsync.service;

import com.sportsync.dto.AttendanceDTO;
import com.sportsync.model.Attendance;
import com.sportsync.model.Coach;
import com.sportsync.model.Student;
import com.sportsync.repository.AttendanceRepository;
import com.sportsync.repository.CoachRepository;
import com.sportsync.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceService {

        private final AttendanceRepository attendanceRepository;
        private final StudentRepository studentRepository;
        private final CoachRepository coachRepository;

        public List<AttendanceDTO> getAllAttendance() {
                return attendanceRepository.findAll().stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());
        }

        public List<AttendanceDTO> getAttendanceByStudent(UUID studentId) {
                return attendanceRepository.findByStudentId(studentId).stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());
        }

        @Transactional
        public AttendanceDTO markAttendance(AttendanceDTO dto, UUID coachId) {
                Student student = studentRepository.findById(dto.getStudentId())
                                .orElseThrow(() -> new RuntimeException("Student not found"));
                Coach coach = coachRepository.findById(coachId)
                                .orElseThrow(() -> new RuntimeException("Coach not found"));

                Attendance attendance = attendanceRepository.findByStudentIdAndSessionDate(dto.getStudentId(), dto.getSessionDate())
                                .orElse(Attendance.builder()
                                                .student(student)
                                                .sessionDate(dto.getSessionDate())
                                                .build());
                                                
                attendance.setStatus(dto.getStatus());
                attendance.setMarkedBy(coach);

                return mapToDTO(attendanceRepository.save(attendance));
        }

        private AttendanceDTO mapToDTO(Attendance attendance) {
                return AttendanceDTO.builder()
                                .id(attendance.getId())
                                .studentId(attendance.getStudent().getId())
                                .studentName(attendance.getStudent().getFirstName() + " "
                                                + attendance.getStudent().getLastName())
                                .sessionDate(attendance.getSessionDate())
                                .status(attendance.getStatus())
                                .markedByCoachName(
                                                attendance.getMarkedBy() != null
                                                                ? attendance.getMarkedBy().getFirstName() + " "
                                                                                + attendance.getMarkedBy()
                                                                                                .getLastName()
                                                                : "Unknown")
                                .build();
        }
}
