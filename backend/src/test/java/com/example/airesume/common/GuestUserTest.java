package com.example.airesume.common;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class GuestUserTest {
    @Test
    void guestUserIdShouldBeZero() {
        assertThat(GuestUser.ID).isEqualTo(0L);
    }

    @Test
    void guestUserClassShouldBeFinal() {
        assertThat(java.lang.reflect.Modifier.isFinal(GuestUser.class.getModifiers())).isTrue();
    }

    @Test
    void guestUserConstructorShouldBePrivate() throws NoSuchMethodException {
        assertThat(java.lang.reflect.Modifier.isPrivate(GuestUser.class.getDeclaredConstructor().getModifiers())).isTrue();
    }
}