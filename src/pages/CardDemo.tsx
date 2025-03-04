// src/pages/CardDemo.tsx
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  CardActions,
  CardDivider,
  CardImage
} from '../components/ui/card/Card';
import { cardInteractions } from '../components/ui/card/Card.styles';

const CardDemo: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Card Component Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Card</CardTitle>
            <CardDescription>Default card with header and content</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a simple card with default styling.</p>
          </CardContent>
        </Card>
        
        {/* Card with custom variant */}
        <Card variant="bordered" size="sm">
          <CardHeader>
            <CardTitle>Bordered Card</CardTitle>
            <CardDescription>Using the bordered variant with small padding</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card uses the bordered variant and has less padding.</p>
          </CardContent>
        </Card>
        
        {/* Card with colored header */}
        <Card>
          <CardHeader variant="gradient">
            <CardTitle className="text-white">Gradient Header</CardTitle>
            <CardDescription className="text-blue-100">Colored gradient header example</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card has a gradient header with custom text colors.</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">Footer with additional information</p>
          </CardFooter>
        </Card>
        
        {/* Card with image */}
        <Card className={cardInteractions.hoverable}>
          <img 
            src="/fabric-images/Cotton.jpg" 
            alt="Cotton Fabric"
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <CardContent>
            <CardTitle as="h4">Card with Image</CardTitle>
            <p className="mt-2">Cards can include images at the top or bottom.</p>
          </CardContent>
          <CardFooter variant="flex">
            <span>Posted 2 days ago</span>
            <a href="#" className="text-blue-600 hover:underline">Read more</a>
          </CardFooter>
        </Card>
        
        {/* Interactive Card */}
        <Card 
          className={`${cardInteractions.selectable} ${selectedCard === 'interactive' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedCard(selectedCard === 'interactive' ? null : 'interactive')}
        >
          <CardHeader>
            <CardTitle>Selectable Card</CardTitle>
            <CardDescription>Click to select this card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card can be selected with a click.</p>
            <p className="mt-2">Status: {selectedCard === 'interactive' ? 'Selected' : 'Not Selected'}</p>
          </CardContent>
        </Card>
        
        {/* Card with actions */}
        <Card variant="primary">
          <CardHeader>
            <CardTitle>Card with Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This card demonstrates action buttons in the footer.</p>
          </CardContent>
          <CardDivider />
          <CardFooter>
            <CardActions align="between">
              <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
            </CardActions>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CardDemo;