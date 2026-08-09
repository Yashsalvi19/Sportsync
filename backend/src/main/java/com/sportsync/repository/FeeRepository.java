package com.sportsync.repository;

import com.sportsync.model.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeeRepository extends JpaRepository<Fee, UUID> {
    List<Fee> findByStudentId(UUID studentId);
}
