# Stage 1: Build the React Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build the Spring Boot Application with frontend static assets
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
WORKDIR /app
COPY backend/pom.xml ./
COPY backend/src ./src
COPY --from=frontend-builder /app/dist ./src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Run the lightweight production container
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/target/*.jar app.jar

# Create directories for persistent DB and uploads
RUN mkdir -p /app/data /app/uploads

EXPOSE 3001
ENV PORT=3001
ENTRYPOINT ["java", "-jar", "app.jar"]
