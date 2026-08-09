package com.sportsync;

import com.sportsync.model.Role;
import com.sportsync.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(RoleRepository roleRepository) {
        return args -> {
            List<String> roles = List.of("ROLE_ADMIN", "ROLE_COACH", "ROLE_STUDENT");
            
            for (String roleName : roles) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    Role role = Role.builder().name(roleName).build();
                    roleRepository.save(role);
                    System.out.println("Seeded role: " + roleName);
                }
            }
        };
    }
}
