# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (cache optimization)
RUN mvn dependency:go-offline -B
COPY src ./src
# Build the application skipping tests (tests will run in CI)
RUN mvn clean package -DskipTests

# Stage 2: Create a minimal production image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar
# Expose the application port
EXPOSE 8080
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
