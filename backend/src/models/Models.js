export class Articles {
    constructor(id, title, author, content, imageUrl, createdAt, updatedAt){
        this.id = id;
        this.title = title;
        this.author = author;
        this.content = content;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class Prices {
    constructor(id, province, price, createdAt, updatedAt){
        this.id = id;
        this.province = province;
        this.price = price;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class Tengkulaks {
    constructor(id, name, address, phone, createdAt, updatedAt){
        this.id = id;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class Users {
    constructor(id, name, email, password, refresh_token, createdAt,updatedAt){
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.refresh_token = refresh_token;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
