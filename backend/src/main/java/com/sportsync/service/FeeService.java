package com.sportsync.service;

import com.sportsync.dto.FeeDTO;
import com.sportsync.model.Fee;
import com.sportsync.model.FeeStatus;
import com.sportsync.model.Student;
import com.sportsync.repository.FeeRepository;
import com.sportsync.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeeService {

    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;

    public List<FeeDTO> getAllFees() {
        return feeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<FeeDTO> getFeesByStudent(UUID studentId) {
        return feeRepository.findByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeeDTO createFee(FeeDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Fee fee = Fee.builder()
                .student(student)
                .amount(dto.getAmount())
                .dueDate(dto.getDueDate())
                .status(FeeStatus.PENDING)
                .build();

        return mapToDTO(feeRepository.save(fee));
    }
    
    @Transactional
    public FeeDTO markAsPaid(UUID id, String transactionId) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fee not found"));
                
        fee.setStatus(FeeStatus.PAID);
        fee.setPaymentDate(LocalDate.now());
        fee.setTransactionId(transactionId);
        
        return mapToDTO(feeRepository.save(fee));
    }

    private FeeDTO mapToDTO(Fee fee) {
        return FeeDTO.builder()
                .id(fee.getId())
                .studentId(fee.getStudent().getId())
                .studentName(fee.getStudent().getFirstName() + " " + fee.getStudent().getLastName())
                .amount(fee.getAmount())
                .dueDate(fee.getDueDate())
                .status(fee.getStatus())
                .paymentDate(fee.getPaymentDate())
                .transactionId(fee.getTransactionId())
                .build();
    }
}
