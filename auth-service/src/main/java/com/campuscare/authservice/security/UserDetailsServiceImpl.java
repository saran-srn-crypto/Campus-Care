package com.campuscare.authservice.security;

import com.campuscare.authservice.model.User;
import com.campuscare.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String emailOrUserId) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(emailOrUserId)
                .or(() -> userRepository.findByUserId(emailOrUserId))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or userId: " + emailOrUserId));
        return UserDetailsImpl.build(user);
    }
}
