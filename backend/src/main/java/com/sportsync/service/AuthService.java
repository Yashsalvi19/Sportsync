package com.sportsync.service;

import com.sportsync.dto.AuthResponse;
import com.sportsync.dto.LoginRequest;
import com.sportsync.dto.RegisterRequest;
import com.sportsync.model.Coach;
import com.sportsync.model.Role;
import com.sportsync.model.Student;
import com.sportsync.model.User;
import com.sportsync.repository.RoleRepository;
import com.sportsync.repository.UserRepository;
import com.sportsync.security.JwtService;
import com.sportsync.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user;
        if ("ROLE_COACH".equals(role.getName())) {
            Coach coach = new Coach();
            coach.setHireDate(LocalDate.now());
            user = coach;
        } else if ("ROLE_STUDENT".equals(role.getName())) {
            Student student = new Student();
            student.setDateOfBirth(LocalDate.now().minusYears(10)); // Default mock
            user = student;
        } else {
            user = new User(); // Admin or generic
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(role);

        userRepository.save(user);
        
        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        String jwtToken = jwtService.generateToken(userDetails);
        
        return buildAuthResponse(user, jwtToken);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        String jwtToken = jwtService.generateToken(userDetails);
        
        return buildAuthResponse(user, jwtToken);
    }
    
    private AuthResponse buildAuthResponse(User user, String jwtToken) {
        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId().toString())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().getName())
                .build();
    }
}
