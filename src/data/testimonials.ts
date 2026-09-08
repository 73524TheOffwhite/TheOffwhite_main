export const googleReviewsUrl =
  "https://www.google.com/maps/place/The+Off+White+Bar+%26+Grill/@15.2619293,73.9632973,17z/data=!4m17!1m8!3m7!1s0x3bbfb3eee483565d:0xad6e50cdef9d0546!2sThe+Off+White+Bar+%26+Grill!8m2!3d15.2619293!4d73.9632973!10e1!16s%2Fg%2F11k9j8r_46!3m7!1s0x3bbfb3eee483565d:0xad6e50cdef9d0546!8m2!3d15.2619293!4d73.9632973!9m1!1b1!16s%2Fg%2F11k9j8r_46";

export type GuestReview = {
  name: string;
  meta: string;
  when: string;
  rating: number;
  quote: string;
};

export const guestReviews: GuestReview[] = [
  {
    name: "Karthik",
    meta: "Local Guide · 375 reviews",
    when: "a month ago",
    rating: 5,
    quote:
      "This place is just really awesome. Great ambience, extremely friendly staff, the food is simply too good. Definitely try the chef special nalupu rice — that dish is so unique and tastes really good. Overall a fantastic restaurant to spend the evening and enjoy your meal. Also I have to say they had very clean restrooms. Thank you.",
  },
  {
    name: "Anup Patil",
    meta: "Local Guide · 5 reviews",
    when: "6 months ago",
    rating: 5,
    quote:
      "Today we had the most amazing lunch at The Off White, Goa! The decor is stylish and inviting, creating a truly special atmosphere. We tried the starters and main course, and everything was absolutely delicious — tender, perfectly seasoned, and full of flavor. The cocktails were top-notch, and the staff were warm, professional, and made our visit memorable. If you're in Goa, this place is a must-visit for incredible food and an unbeatable setting. Will definitely be back!",
  },
  {
    name: "Shreyas Devarajan",
    meta: "Local Guide · 36 reviews",
    when: "7 months ago",
    rating: 5,
    quote:
      "Absolutely brilliant. This place is so good, I was quite literally inhaling the food. The drinks are exquisite; the coconut toffee for a mocktail is an excellent choice. Sanjay served us during lunch and had excellent recommendations. I am in awe — for South Goa it's a top choice.",
  },
  {
    name: "Samyuktha Roy",
    meta: "Local Guide · 18 reviews",
    when: "8 months ago",
    rating: 5,
    quote:
      "Superior service, ambrosia-like food, and a soothing ambience — that's how I'd put my experience at The Off White Bar & Grill. Went there based on an acquaintance's recommendation, and boy, am I glad I did! The Mutton Nelapu Pulao is one of the best items I've tasted not only in Goa, but also in comparison to the curated meals in big cities like Bengaluru. It is flavourful, perfectly cooked and a sublime experience. The servers are extremely professional, polite, and accommodating, and the ambience is calm with a pleasant view. I very rarely rate any restaurant with 5 stars, but this one was without a second thought.",
  },
  {
    name: "Surjeet Sharma",
    meta: "2 reviews",
    when: "a month ago",
    rating: 5,
    quote:
      "Food is top notch and the ambience is very nice. Service is super fast and efficient, and the location is convenient as it's close to the railway station. Absolutely delicious — the flavors were perfectly balanced and everything tasted incredibly fresh! The servers anticipated our needs, bringing water refills and extra napkins without even being asked, and treated us like valued guests. Really loved the music. Thank you, The Off White team — you are incredible.",
  },
];
