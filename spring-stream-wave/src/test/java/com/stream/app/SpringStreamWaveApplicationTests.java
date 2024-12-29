package com.stream.app;

import com.stream.app.services.VideoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SpringStreamWaveApplicationTests {
	@Autowired
	VideoService videoService;

	@Test
	void contextLoads() {
		videoService.processVideo("dbf66a4b-0a09-483f-b800-83a9a6f3f197");
	}

}
