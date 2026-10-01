<?php

test('guests are redirected to login from the root route', function () {
    $this->get('/')
        ->assertRedirect(route('login'));
});
