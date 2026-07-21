package com.carte.estimateurippbackend.controller;

import com.carte.estimateurippbackend.model.EstimationResult;
import com.carte.estimateurippbackend.service.EstimationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estimation")
@CrossOrigin(origins = "http://localhost:4200")
public class EstimationController {

  private final EstimationService estimationService;

  public EstimationController(EstimationService estimationService) {
    this.estimationService = estimationService;
  }

  @PostMapping
  public EstimationResult estimerIPP(
    @RequestParam int nbJours,
    @RequestParam List<String> codes
  ) {
    return estimationService.estimerIPP(nbJours, codes);
  }
}
