package com.sportsync.dto;

import com.sportsync.model.FeeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeDTO {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private BigDecimal amount;
    private LocalDate dueDate;
    private FeeStatus status;
    private LocalDate paymentDate;
    private String transactionId;
}
