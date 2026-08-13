package com.sportsync.controller;

import com.sportsync.dto.ApiResponse;
import com.sportsync.dto.TournamentDTO;
import com.sportsync.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH', 'ROLE_STUDENT')")
    public ResponseEntity<ApiResponse<List<TournamentDTO>>> getAllTournaments() {
        return ResponseEntity.ok(ApiResponse.success("Tournaments retrieved", tournamentService.getAllTournaments()));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH')")
    public ResponseEntity<ApiResponse<TournamentDTO>> createTournament(@RequestBody TournamentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Tournament created", tournamentService.createTournament(dto)));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH')")
    public ResponseEntity<ApiResponse<TournamentDTO>> updateTournament(@PathVariable UUID id, @RequestBody TournamentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Tournament updated", tournamentService.updateTournament(id, dto)));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_COACH')")
    public ResponseEntity<ApiResponse<Void>> deleteTournament(@PathVariable UUID id) {
        tournamentService.deleteTournament(id);
        return ResponseEntity.ok(ApiResponse.success("Tournament deleted", null));
    }
}
