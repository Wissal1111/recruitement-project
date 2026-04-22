// service/BlacklistService.java
package com.projet.recruitment_service.service;

import com.projet.recruitment_service.dto.request.BlacklistRequest;
import com.projet.recruitment_service.entity.ParticipantBlacklist;
import com.projet.recruitment_service.exception.BusinessException;
import com.projet.recruitment_service.repository.ParticipantBlacklistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BlacklistService {

    private final ParticipantBlacklistRepository blacklistRepository;

    // RC-17
    public ParticipantBlacklist blacklist(UUID creatorId, BlacklistRequest request) {
        if (blacklistRepository.existsByStudyIdAndParticipantId(
                request.getStudyId(), request.getParticipantId())) {
            throw new BusinessException("Participant is already blacklisted", HttpStatus.CONFLICT);
        }

        ParticipantBlacklist entry = ParticipantBlacklist.builder()
                .studyId(request.getStudyId())
                .participantId(request.getParticipantId())
                .creatorId(creatorId)
                .reason(request.getReason())
                .build();

        return blacklistRepository.save(entry);
    }

    // RC-18
    public List<ParticipantBlacklist> getBlacklist(UUID studyId) {
        return blacklistRepository.findByStudyId(studyId);
    }

    // RC-19
    public void removeFromBlacklist(UUID blacklistId) {
        ParticipantBlacklist entry = blacklistRepository.findById(blacklistId)
                .orElseThrow(() -> new BusinessException("Blacklist entry not found", HttpStatus.NOT_FOUND));
        blacklistRepository.delete(entry);
    }
}
