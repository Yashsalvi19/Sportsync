package com.sportsync.service;

import com.sportsync.dto.CoachDTO;
import com.sportsync.model.Coach;
import com.sportsync.repository.CoachRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoachService {

    private final CoachRepository coachRepository;

    public List<CoachDTO> getAllCoaches() {
        return coachRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public CoachDTO updateCoach(UUID id, CoachDTO dto) {
        Coach coach = coachRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coach not found"));
                
        coach.setFirstName(dto.getFirstName());
        coach.setLastName(dto.getLastName());
        coach.setPhone(dto.getPhone());
        coach.setSpecialization(dto.getSpecialization());
        
        return mapToDTO(coachRepository.save(coach));
    }
    
    public void deleteCoach(UUID id) {
        coachRepository.deleteById(id);
    }

    private CoachDTO mapToDTO(Coach coach) {
        return CoachDTO.builder()
                .id(coach.getId())
                .firstName(coach.getFirstName())
                .lastName(coach.getLastName())
                .email(coach.getEmail())
                .phone(coach.getPhone())
                .specialization(coach.getSpecialization())
                .hireDate(coach.getHireDate())
                .build();
    }
}
