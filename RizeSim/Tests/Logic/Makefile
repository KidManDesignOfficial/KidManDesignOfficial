CXX ?= g++
CXXFLAGS ?= -std=c++20 -O2 -Wall -Wextra -Werror -pedantic
INC := -I../../Source/RizeSim/Public
BUILD := build

all: test

$(BUILD)/logic_tests: LogicTests.cpp $(wildcard ../../Source/RizeSim/Public/Sim/*.h)
	@mkdir -p $(BUILD)
	$(CXX) $(CXXFLAGS) $(INC) LogicTests.cpp -o $@

test: $(BUILD)/logic_tests
	./$(BUILD)/logic_tests

clean:
	rm -rf $(BUILD)

.PHONY: all test clean
