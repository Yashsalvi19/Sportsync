package com.sportsync.service;

import com.sportsync.dto.StudentDTO;
import com.sportsync.model.Student;
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
public class StudentService {

    private final StudentRepository studentRepository;

    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public StudentDTO updateStudent(UUID id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
                
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setPhone(dto.getPhone());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setEmergencyContact(dto.getEmergencyContact());
        
        return mapToDTO(studentRepository.save(student));
    }
    
    @Transactional
    public void deleteStudent(UUID id) {
        studentRepository.deleteById(id);
    }

    private StudentDTO mapToDTO(Student student) {
        return StudentDTO.builder()
                .id(student.getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(student.getEmail())
                .phone(student.getPhone())
                .dateOfBirth(student.getDateOfBirth())
                .emergencyContact(student.getEmergencyContact())
                .profilePicUrl(student.getProfilePicUrl())
                .coachName(student.getCoach() != null
                                ? student.getCoach().getFirstName() + " "
                                                + student.getCoach().getLastName() : "Unassigned")
                .build();
    }
}
