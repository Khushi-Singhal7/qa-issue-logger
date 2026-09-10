package com.qalogger.config;

import com.qalogger.model.Issue;
import com.qalogger.model.Project;
import com.qalogger.repository.IssueRepository;
import com.qalogger.repository.ProjectRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(ProjectRepository projectRepo, IssueRepository issueRepo) {
        return args -> {
            if (projectRepo.count() == 0) {
                String now = Instant.now().toString();
                String today = LocalDate.now().toString();
                String yesterday = LocalDate.now().minusDays(1).toString();
                String twoDaysAgo = LocalDate.now().minusDays(2).toString();

                Project p1 = new Project(
                        "proj-ecommerce",
                        "E-Commerce Web Portal",
                        "SHOP",
                        "End-to-end regression testing for storefront, payment gateway, and cart flows.",
                        now,
                        now
                );

                Project p2 = new Project(
                        "proj-banking",
                        "Mobile Banking App",
                        "BANK",
                        "Mobile app security, biometric auth, and NEFT/RTGS transaction QA.",
                        now,
                        now
                );

                projectRepo.save(p1);
                projectRepo.save(p2);

                Issue i1 = new Issue(
                        "issue-demo-1",
                        "proj-ecommerce",
                        1,
                        twoDaysAgo,
                        "Checkout & Payments",
                        "Checkout button becomes unclickable when entering coupon code with special characters.",
                        "Discount applies or user receives friendly validation error; checkout button remains clickable.",
                        null,
                        null,
                        "Open",
                        "High",
                        "Reproduced on Chrome 128 (Windows 11). Console throws Uncaught TypeError.",
                        now,
                        now
                );

                Issue i2 = new Issue(
                        "issue-demo-2",
                        "proj-ecommerce",
                        2,
                        yesterday,
                        "Authentication",
                        "Google Social Sign-In redirects to a blank white screen upon 2FA verification prompt.",
                        "User redirected to dashboard with valid active session cookie.",
                        null,
                        null,
                        "In Progress",
                        "Critical",
                        "Investigating OAuth redirect URI whitelist in staging config.",
                        now,
                        now
                );

                Issue i3 = new Issue(
                        "issue-demo-3",
                        "proj-ecommerce",
                        3,
                        today,
                        "Cart & Basket",
                        "Cart quantity spinner allows entering negative numbers manually.",
                        "Quantity field should restrict negative numbers and minimum value should be 1.",
                        null,
                        null,
                        "Resolved",
                        "Medium",
                        "Fixed in build #1042 with input min=\"1\" restriction.",
                        now,
                        now
                );

                issueRepo.save(i1);
                issueRepo.save(i2);
                issueRepo.save(i3);

                System.out.println("[DataInitializer] Seeded sample projects and issues into H2 Database.");
            }
        };
    }
}
