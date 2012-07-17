# Post Specification

A post consists of two parts:

1.  Meta info.
2.  Content.

## Meta Info

Example:

    <!--
    {
        "layout": "post",
        "title": "A flexible event model in JavaScript-《Ajax In Action》",
        "date": "2009-11-03 15:41",
        "comments": true,
        "categories": ["技术相关", "tech"]
    }
    -->


Meta infomations must be surrounded by `<!-- -->`, which is the default syntax of html comments. And all information should be written in json format.

Available attributes:

*   title - required.

    The title of the current post.

*   date - required.

    The created date the current post.

*   comments - optional, default to `true`.

    If comments is allowed or not.

*   categories - optional, default to `null`.

    The categories of current post. It can be a string or an array of string.

*   layout - Optional, default to `post`.

    The layout of current post.

## Content

The content of current page. Wanna regards it as a markdown file.

You can search the web about what is markdown and how to write a markdown file. Trust me, it's super easy.
