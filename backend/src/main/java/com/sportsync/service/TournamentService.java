package com.sportsync.service;

import com.sportsync.dto.TournamentDTO;
import com.sportsync.model.Tournament;
import com.sportsync.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;

    public List<TournamentDTO> getAllTournaments() {
        return tournamentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public TournamentDTO createTournament(TournamentDTO dto) {
        Tournament tournament = Tournament.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(dto.getStatus())
                .build();

        return mapToDTO(tournamentRepository.save(tournament));
    }
    
    public TournamentDTO updateTournament(UUID id, TournamentDTO dto) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
                
        tournament.setName(dto.getName());
        tournament.setDescription(dto.getDescription());
        tournament.setStartDate(dto.getStartDate());
        tournament.setEndDate(dto.getEndDate());
        tournament.setStatus(dto.getStatus());
        
        return mapToDTO(tournamentRepository.save(tournament));
    }
    
    public void deleteTournament(UUID id) {
        tournamentRepository.deleteById(id);
    }

    private TournamentDTO mapToDTO(Tournament tournament) {
        return TournamentDTO.builder()
                .id(tournament.getId())
                .name(tournament.getName())
                .description(tournament.getDescription())
                .startDate(tournament.getStartDate())
                .endDate(tournament.getEndDate())
                .status(tournament.getStatus())
                .build();
    }
}
