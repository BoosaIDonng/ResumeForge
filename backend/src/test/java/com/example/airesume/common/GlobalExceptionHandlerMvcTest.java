package com.example.airesume.common;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@WebMvcTest(
    controllers = GlobalExceptionHandlerMvcTest.TestController.class,
    excludeAutoConfiguration = {
    DataSourceAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class,
    RabbitAutoConfiguration.class,
    RedisAutoConfiguration.class,
    FlywayAutoConfiguration.class
})
@AutoConfigureMockMvc
@Import(GlobalExceptionHandlerMvcTest.TestController.class)
class GlobalExceptionHandlerMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void apiExceptionShouldReturn400WithCodeAndMessage() throws Exception {
        mockMvc.perform(post("/test/api-error")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("TEST_ERROR"))
                .andExpect(jsonPath("$.message").value("测试异常"));
    }

    @Test
    void validationExceptionShouldReturn400WithValidationError() throws Exception {
        mockMvc.perform(post("/test/validated")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("请求参数不合法"));
    }

    @Test
    void validRequestShouldReturn200() throws Exception {
        mockMvc.perform(post("/test/validated")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"张三\"}"))
                .andExpect(status().isOk());
    }

    @RestController
    @Validated
    static class TestController {
        @PostMapping("/test/api-error")
        public void apiError() {
            throw new ApiException("TEST_ERROR", "测试异常");
        }

        @PostMapping("/test/validated")
        public String validated(@Valid @RequestBody TestRequestBody body) {
            return "ok";
        }
    }

    static class TestRequestBody {
        @NotBlank(message = "名称不能为空")
        private String name;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}
