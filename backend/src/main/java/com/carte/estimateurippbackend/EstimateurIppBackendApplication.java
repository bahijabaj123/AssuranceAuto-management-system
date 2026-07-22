package com.carte.estimateurippbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.thymeleaf.autoconfigure.ThymeleafAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = { ThymeleafAutoConfiguration.class })@EnableScheduling
public class EstimateurIppBackendApplication {

  public static void main(String[] args) {
    SpringApplication.run(EstimateurIppBackendApplication.class, args);
  }

}
