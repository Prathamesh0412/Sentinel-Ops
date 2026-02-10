# Getting Started

### Reference Documentation
For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/4.0.2/maven-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/4.0.2/maven-plugin/build-image.html)
* [Spring Boot DevTools](https://docs.spring.io/spring-boot/4.0.2/reference/using/devtools.html)
* [Spring Web](https://docs.spring.io/spring-boot/4.0.2/reference/web/servlet.html)
* [Spring Data JPA](https://docs.spring.io/spring-boot/4.0.2/reference/data/sql.html#data.sql.jpa-and-spring-data)
* [HTTP Client](https://docs.spring.io/spring-boot/4.0.2/reference/io/rest-client.html#io.rest-client.restclient)
* [PDF Document Reader](https://docs.spring.io/spring-ai/reference/api/etl-pipeline.html#_pdf_page)
* [Tika Document Reader](https://docs.spring.io/spring-ai/reference/api/etl-pipeline.html#_tika_docx_pptx_html)

### Guides
The following guides illustrate how to use some features concretely:

* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)
* [Accessing Data with JPA](https://spring.io/guides/gs/accessing-data-jpa/)

### Maven Parent overrides

Due to Maven's design, elements are inherited from the parent POM to the project POM.
While most of the inheritance is fine, it also inherits unwanted elements like `<license>` and `<developers>` from the parent.
To prevent this, the project POM contains empty overrides for these elements.
If you manually switch to a different parent and actually want the inheritance, you need to remove those overrides.

## Inventory intelligence model

The AI inventory card is powered by the Python script under `model/logic.py`.

### Install Python dependencies

```bash
cd model
python -m venv .venv
.venv\\Scripts\\activate  # use source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
```

### Run the model manually

```bash
cd model
python logic.py --output-format=text --plot
```

Pass your own payload via `--input-file=payload.json` where the JSON object contains `products`, `inventory`, and `sales` arrays.

### Spring Boot endpoint

`GET /api/inventory-insights` runs the model with its built-in defaults. `POST /api/inventory-insights` accepts the JSON payload and forwards it to the Python process, returning the model output.

Configure the Python interpreter or script location through `ml.inventory.python-command` and `ml.inventory.script-path` in `application.properties`.

