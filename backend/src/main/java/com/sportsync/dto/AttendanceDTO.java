package com.sportsync.dto;

import com.sportsync.model.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private LocalDate sessionDate;
    private AttendanceStatus status;
    private String markedByCoachName;
}
