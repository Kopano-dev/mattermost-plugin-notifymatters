# Tools

YARN ?= yarn

# Variables
DIST    := ./build
DATE    ?= $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
VERSION ?= $(shell git describe --tags --always --dirty --match=v* 2>/dev/null | sed 's/^v//' || \
			cat $(CURDIR)/../.version 2> /dev/null || echo 0.0.0-unreleased)

# Build

.PHONY: all
all: js

# Helpers

$(DIST): ; $(info creating dist path ...) @
	mkdir $(DIST)

.PHONY: js
js: vendor | $(DIST) ; $(info building Webapp plugin ...)    @
	@rm -rf build

	@BUILD_VERSION=$(VERSION) BUILD_DATE=$(DATE) $(YARN) webpack --env.prod --display-error-details --verbose --progress

# Helpers

.PHONY: lint
lint: vendor | $(BASE) ; $(info running Webapp eslint ...)	@
	$(YARN) eslint .

.PHONY: lint-checkstyle
lint-checkstyle: vendor | $(BASE) ; $(info running Webapp eslint checkstyle ...)	@
	@mkdir -p ../test
	$(YARN) eslint -f checkstyle -o ../test/tests.eslint.xml . || true

# Yarn

.PHONY: vendor
vendor: .yarninstall

.yarninstall: package.json ; $(info getting depdencies with yarn ...)   @
	@$(YARN) install --silent
	@touch $@

.PHONY: clean
clean: ; $(info cleaning identifier Webapp ...)  @
	$(YARN) cache clean

	@rm -rf $(DIST)
	@rm -rf node_modules
	@rm -f .yarninstall

.PHONY: version
version:
	@echo $(VERSION)
